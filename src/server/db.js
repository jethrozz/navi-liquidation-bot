import connectDB from '../util/MysqlUtil';
/**
 * 分页查询用户数据
 * @param {number} page - 页码（从1开始）
 * @param {number} pageSize - 每页数据量
 * @returns {Promise<{users: Array, total: number}>} 分页数据
 */
export async function getUsersWithPagination(page = 1, pageSize = 10) {
    // 计算偏移量
    const offset = (page - 1) * pageSize;
    
    // 查询总记录数
    const [totalResult] = await connectDB.query(
      'SELECT COUNT(*) AS total FROM navi_deposit_user'
    );
    
    // 查询分页数据
    const [rows] = await connectDB.query(
      'SELECT * FROM navi_deposit_user LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    return {
      users: rows,
      total: totalResult[0].total
    };
  }

/**
 * 新增单个用户
 * @param {string} address - 用户地址
 * @returns {Promise<object>} 插入结果
 */
export async function createUser(address) {
  const [result] = await connectDB.query(
    'INSERT INTO navi_deposit_user (address) VALUES (?)',
    [address]
  );
  return result;
}

/**
 * 批量新增用户
 * @param {string[]} addresses - 用户地址数组
 * @returns {Promise<object>} 批量插入结果
 */
export async function createUsers(addresses) {
  // 构建批量插入的值数组
  const values = addresses.map(address => [address]);
  
  const [result] = await connectDB.query(
    'INSERT INTO navi_deposit_user (address) VALUES ?',
    [values]
  );
  return result;
}

/**
 * 查询digest是否存在
 * @param {string} digest - 交易摘要
 * @returns {Promise<boolean>} 是否存在
 */
export async function digestExists(digest) {
    const [rows] = await connectDB.query(
      'SELECT 1 FROM navi_transaction_digest WHERE digest = ? LIMIT 1', 
      [digest]
    );
    return rows.length > 0;
  }
  
  /**
   * 新增单个digest记录
   * @param {string} digest - 交易摘要
   * @returns {Promise<object>} 插入结果
   */
  export async function createDigest(digest) {
    const [result] = await connectDB.query(
      'INSERT INTO navi_transaction_digest (digest) VALUES (?)',
      [digest]
    );
    return result;
  }
  
  /**
   * 批量新增digest记录
   * @param {string[]} digests - 交易摘要数组
   * @returns {Promise<object>} 批量插入结果
   */
  export async function createDigests(digests) {
    // 构建批量插入的值数组
    const values = digests.map(digest => [digest]);
    
    const [result] = await connectDB.query(
      'INSERT INTO navi_transaction_digest (digest) VALUES ?',
      [values]
    );
    return result;
  }
  