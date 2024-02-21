import React,{useState,useEffect,useLayoutEffect,useRef} from 'react';
import Compose from '../tabs/compose';
import Template from '../tabs/template';
import { useHistory } from "react-router-dom";
import '../../styles.css';

// dev/rochester/1

function Main() {
    const history = useHistory();
    const [active,setActive]=useState("compose");
    const [user,setUser]=useState({img:'',name:'',email:''})
    const [showCard,setshowCard]=useState(false)
    const showRef=useRef()
    
    useLayoutEffect(()=>{
        const user = JSON.parse(localStorage.getItem('user'));
       if(!user){
        history.replace('/')
       }
    })
    
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log(user)
        setUser({img:user.user_profile_image,name:user.user_nickname,email:user.user_email})      
      }, []);

      useEffect(() => {
        function handleClickOutside(event) {
          if (showRef.current && !showRef.current.contains(event.target)) {
            setshowCard(false)
          }
        }
       
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [showRef]);

      const logout=()=>{
        localStorage.clear();
        history.replace('/')
      }
    return (
        <div className='container'>
               <div className='header'>
              
                            <div onClick={()=>setActive("compose")} style={{backgroundColor:active=="compose"?"#529b50":''}} className='nav-link' >Compose</div>
                            <div onClick={()=>setActive("templates")} style={{backgroundColor:active=="templates"?"#529b50":''}} className='nav-link'>Templates</div>
                            <div onClick={()=>setshowCard(!showCard)} className='usericon'><img style={{borderRadius:'50%'}} src={user.img}/></div>
                            {showCard && <div ref={showRef} className='usercard'>
                               <h1 style={{color:'#000',fontSize:'12px'}}>{user.name}</h1>
                               <p style={{color:'#000',fontSize:'8px'}}>{user.email}</p>
                               <div style={{height:'1px' ,width:'100%',backgroundColor:'#E0E0E0'}}></div>
                               <div onClick={()=>logout()} style={{ backgroundColor:'#FE6767',display:'flex',alignItems:'center',justifyContent:'center',marginTop:'10px',padding:'5px',color:'#fff',cursor:'pointer'}}>
                                Logout
                               </div>
                               <p style={{color:'#000',fontSize:'8px',color:'#807b7b',marginTop:'4px'}}>Version : 1.0.2</p>
                                </div>}
               </div>
                       
                   <div className='main'>
                    {active=="compose" && <Compose/>}
                    {active=="templates" && <Template/>}
                    </div>
        </div>
    )
}

export default Main;