/**
 * 获取URL参数
 * @param {string} name 参数名
 */
export function getQueryParameter(name: string) {
  const params = new URLSearchParams(location.search);
  return params.get(name);
}
