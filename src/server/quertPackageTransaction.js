import axios from 'axios';
import {createUser, getLatestProcessDigest, createDigest} from './db.js';

const api = axios.create({
    baseURL: 'https://internal.suivision.xyz',
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
        'Origin':'https://internal.suivision.xyz'
    }
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function queryPackageTransactionBlock() {
    let digestRow = await getLatestProcessDigest();
    let nextPageCursor = null;
    if(digestRow.length>0){
        console.log('digestRow',digestRow);
        nextPageCursor = digestRow[0].digest;
    }
    
    const digestTxs = []; // 存储符合条件的sender
    do {
        //随机获取5-10秒
        const randomDelay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
        console.log('随机延迟:', randomDelay, '毫秒');
        await sleep(randomDelay); // 等待 2 秒
        const params = {
            "jsonrpc": "2.0",
            "id": 93,
            "method": "suix_queryTransactionBlocks",
            "params": [
                {
                    "filter": {
                        "InputObject": "0x81c408448d0d57b3e371ea94de1d40bf852784d3e225de1e74acab3e8395c18f"
                    },
                    "options": {
                        "showBalanceChanges": false,
                        "showEffects": true,
                        "showEvents": true,
                        "showInput": true
                    }
                },
                nextPageCursor,
                100,
                true
            ]
        };

        try {
            const response = await api.post('/mainnet/api', params);
            const { result } = response.data;
            if (!result || !result.data) continue;
            // 处理每笔交易
            for (const tx of result.data) {
            
                const transactions = tx.transaction?.data?.transaction?.transactions || [];
                for (const action of transactions) {
                    if (action.MoveCall) {
                        const { package: pkg, module, function: func } = action.MoveCall;

                        // 检查是否符合条件
                        if (pkg === "0x81c408448d0d57b3e371ea94de1d40bf852784d3e225de1e74acab3e8395c18f" &&
                            module === "incentive_v3" &&
                            func === "entry_deposit") {
                            //console.log('找到符合条件的交易:', tx.transaction?.data?.sender);
                            // 记录sender
                            if (tx.transaction?.data?.sender) {
                                digestTxs.push({
                                    digest: tx.digest,
                                    sender: tx.transaction?.data?.sender
                                });
                            }
                            break; // 找到匹配后跳出当前交易循环
                        }
                    }
                }
            }
            // 更新下一页游标
            for (const digestTx of digestTxs) {
                console.log('找到符合条件的交易:', digestTx);
                try{
                    createUser(digestTx.sender);
                }catch(error){
                    console.error('数据库操作 createUser 失败:', error);
                }

                try{
                    createDigest(digestTx.digest);
                }catch(error){
                    console.error('数据库操作 createDigest 失败:', error);
                }
            }
            nextPageCursor = result.hasNextPage ? result.nextCursor : null;
        } catch (error) {
            console.error('API请求失败:', error);
            break;
        }
    } while (nextPageCursor !== null); // 当还有下一页时继续循环
    return senders; // 返回所有符合条件的sender
}