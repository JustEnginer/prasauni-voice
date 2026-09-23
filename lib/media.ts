export function socialPlatform(value:string):'facebook'|'tiktok'|null {
 try {const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;
 if(['facebook.com','www.facebook.com','m.facebook.com','web.facebook.com'].includes(u.hostname))return 'facebook';
 if(['tiktok.com','www.tiktok.com'].includes(u.hostname))return 'tiktok';
 }catch{}return null;
}
export function embedUrl(source:string,video:boolean,autoplay:boolean,muted=true){
 const platform=socialPlatform(source);
 if(platform==='tiktok'){const id=source.match(/\/(?:video|photo)\/(\d+)(?:[/?#]|$)/)?.[1];return id?`https://www.tiktok.com/player/v1/${id}?autoplay=${autoplay&&video?1:0}&muted=${muted?1:0}&controls=1&description=1&rel=0`:null}
 if(platform==='facebook')return `https://www.facebook.com/plugins/${video?'video':'post'}.php?href=${encodeURIComponent(source)}&show_text=${video?'false':'true'}&width=500${video?`&autoplay=${autoplay?'true':'false'}&mute=${muted?'true':'false'}`:''}`;
 return null;
}
export function isVideoPost(p:{kind:string;source_url:string}){return ['video','tiktok'].includes(p.kind)||(p.kind==='facebook'&&/\/(videos|reel|watch)(\/|\?)/.test(p.source_url))}
