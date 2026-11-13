import {base64Decode, base64Encode} from "@/utils/util";
import {delCache, getCache, setCache} from "@/utils/cache";
import _ from "lodash";
import {getCookie, setCookie} from "@/utils/cookie";

const userCacheKey = 'uc';

export function checkPermissions(authority: boolean | string | string[], currentAuthority?: string[]) {
  if (!authority) {
    return true;
  }
  if (Array.isArray(authority)) {
    if (authority.includes('all')) {
      return true;
    }
    if (Array.isArray(currentAuthority)) {
      if (currentAuthority.some((item) => authority.includes(item))) {
        return true;
      }
    } else if (currentAuthority && authority.includes(currentAuthority)) {
      return true;
    }
    return false;
  }
  if (typeof authority === 'string') {
    if (authority === 'all') {
      return true;
    }
    if (Array.isArray(currentAuthority)) {
      if (currentAuthority.some((item) => authority === item)) {
        return true;
      }
    } else if (authority === currentAuthority) {
      return true;
    }
    return false;
  }
  return false;
}

export function setUserCache(userInfo: any) {
  let info = _.cloneDeep(userInfo);
  delete info.privs;
  setCache(userCacheKey, base64Encode(JSON.stringify(info)));
}

export function getUserCache(json = true) {
  const str = getCache(userCacheKey);
  if (!str) {
    return undefined;
  }
  if (!json) {
    return str;
  }
  try {
    return JSON.parse(base64Decode(str));
  } catch (e) {
    return str;
  }
}

export function getAccessToken() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('accessToken') || getCookie('param-accessToken') || '';
}

/** 由当前 host 推导父域(registrable domain): resource.xxzx.paretop.net → .paretop.net;
 *  resource-online.foleac.net → .foleac.net; localhost/IP/两段主机不提升(开发环境) */
function sharedCookieDomain(): string {
  const parts = window.location.hostname.split('.');
  if (parts.length < 3 || !/^[a-zA-Z]{2,}$/.test(parts[parts.length - 1])) return '';
  return '.' + parts.slice(-2).join('.');
}

/**
 * 登录态共享提升（2026-11 跨子系统 URL token 凭证专项）：
 * 把 URL 直链 token 或历史 host-only cookie 提升写入父域共享 cookie，
 * 使跨 console 跳转（window.open / same-site iframe，如资源推荐弹层）不再于 URL 携带 accessToken。
 * 父域按当前 host 自动推导（多环境：paretop.net / foleac.net 等）；顶层窗口才写（iframe/wujie 上下文由宿主页面负责登录态）。
 */
export function promoteSharedCookie() {
  try {
    const domain = sharedCookieDomain();
    if (!domain) return;
    if (window.self !== window.top) return;
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('accessToken') || getCookie('param-accessToken');
    if (!token) return;
    document.cookie = `param-accessToken=${encodeURIComponent(token)}; path=/; domain=${domain}`;
  } catch {
    /* 隐私模式/域限制等场景静默降级 */
  }
}
promoteSharedCookie();

export function toLogin() {
  setCookie('param-accessToken', '', -1, '');
  // 同步清除父域共享 cookie（凭证专项；历史 host-only 与共享域并存）
  try {
    const d = sharedCookieDomain();
    if (d) document.cookie = 'param-accessToken=; path=/; domain=' + d + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch {}
  delCache(userCacheKey);
  window.location.href =
    '/client-proxy/oauth/logout?retUrl=' + encodeURIComponent(window.location.href);
}
