"use client";
import {useEffect,useRef,useState} from 'react';
import {embedUrl,socialPlatform,isVideoPost} from '@/lib/media';
import {api} from "./site-shell";
import type {Post} from '@/lib/models';
export default function MediaPlayer({post,autoplay=false}:{post:Post;autoplay?:boolean}){
 const container=useRef<HTMLDivElement>(null);const videoRef=useRef<HTMLVideoElement>(null);const[visible,setVisible]=useState(!autoplay);const[sound,setSound]=useState(false);const[failed,setFailed]=useState(false);
 const counted=useRef(false);
 useEffect(()=>{if(visible&&!counted.current&&post.status==="published"){counted.current=true;api(`posts/${post.id}/view`,{method:"POST"}).catch(()=>{})}},[visible,post.id,post.status]);
 const video=isVideoPost(post);const platform=socialPlatform(post.source_url);
 useEffect(()=>{if(!container.current)return;const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:0.25});observer.observe(container.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{const el=videoRef.current;if(!el||!autoplay)return;if(visible)el.play().catch(()=>{});else el.pause()},[visible,autoplay]);
 const src=embedUrl(post.source_url,video,autoplay&&!sound,!sound);
 return <div ref={container} className={`inline-media ${video?'inline-video':'inline-photo'}`}>
 {platform&&src?<>{visible?<iframe title={post.title} src={src} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<div className="media-wait">{post.title}</div>}{video&&platform==='tiktok'&&<button type="button" className="text-link" onClick={()=>setSound(s=>!s)}>{sound?'Mute video':'Enable sound · आवाज खोल्नुहोस्'}</button>}<a href={post.source_url} target="_blank" rel="noreferrer">Open original · {platform} ↗</a></>:post.media_url?<>{video?<video ref={videoRef} src={post.media_url} controls autoPlay={autoplay} muted playsInline preload="metadata" onError={()=>setFailed(true)}/>:<img src={post.media_url} alt={post.title} loading="lazy" onError={()=>setFailed(true)}/>}</>:null}
 {failed&&<p role="alert">Media could not load. Please try again later.</p>}
 </div>
}
