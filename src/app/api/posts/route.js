import queryPackageTransactionBlock from '../../../server/quertPackageTransaction';

export async function POST(request) {
            // 由于 await 只能在异步函数中使用，因此将 useEffect 回调函数改为异步函数
            queryPackageTransactionBlock().then(() => {
                // 可在此处添加查询成功后的处理逻辑
              }).catch((error) => {
                console.error('查询包交易块时出错:', error);
              });

  return Response.json({ "success":true })
}