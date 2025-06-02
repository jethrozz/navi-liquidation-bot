import { api } from '../util/api';

export default async function queryPackageTransactionBlock() {
    let nextPageCursor = null;
    const senders = []; // 存储符合条件的sender
    do {
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

                            // 记录sender
                            if (tx.transaction?.data?.sender) {
                                senders.push(tx.transaction.data.sender);
                            }
                            break; // 找到匹配后跳出当前交易循环
                        }
                    }
                }
            }
            // 更新下一页游标
            nextPageCursor = result.hasNextPage ? result.nextCursor : null;
        } catch (error) {
            console.error('API请求失败:', error);
            break;
        }
    } while (nextPageCursor !== null); // 当还有下一页时继续循环
    return senders; // 返回所有符合条件的sender
}