import  React,{useState,useEffect,useLayoutEffect} from "react";
import { useHistory } from "react-router-dom";
import {getLogin,getToken,getBoard} from '../apiservice/docapi';
import Loading from "../loading";
import '../../styles.css';
import toast, { Toaster } from 'react-hot-toast';

function Login() {
    const history = useHistory();
    const [pageLoading,setPageLoading]=useState(true);
    const [islogin,setIslogin]=useState(false)
    const [form, setForm] = useState({email: '',pass: '',subdo:''})
    const [errors, setErrors] =useState({email: '',pass: '',subdo:''});
    const changeHandler = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    useLayoutEffect(()=>{
        const user = JSON.parse(localStorage.getItem('user'));
        if(user){
            history.replace('/home')
        }
    })
    

    useEffect(()=>{
        callGetToken();
    },[])

    const callGetToken=async()=>{
        try {
         
            let data = JSON.stringify({  "app_board": "gnb",      "app_token": "",      "app_uuid": 0,      "language_code": "en",      "version_number": "1.0.16"    });
            const result = await getToken(data);
            localStorage.setItem("gnb-token", result.response.app_token);
            setPageLoading(false)
            console.log(result)  
          } catch (error) {
            setPageLoading(false)

          }
    }
    
    const callGetBoard=async()=>{
        var Token;
        try {
             Token=localStorage.getItem("gnb-token")
            if (!Token){
                let data = JSON.stringify({  "app_board": "gnb",      "app_token": "",      "app_uuid": 0,      "language_code": "en",      "version_number": "1.0.16"    });
                const result = await getToken(data);
                localStorage.setItem("gnb-token", result.response.app_token);
                Token=result.response.app_token;
            }
            let data = JSON.stringify({ "subdomain":form.sub.toLowerCase() , "app_board": "gnb",   "app_token":Token ,      "app_uuid": 0,      "language_code": "en",      "version_number": "1.0.16"    });
            const result = await getBoard(data)
            if(result.success){
                var cnb_server = "https://" + result.response.cnb_server
                localStorage.setItem("baseUrl", cnb_server);
                login()
            } else {
                toast.error(result.response)
                setIslogin(false)  
            }          
          } catch (error) {
            setIslogin(false)  
            toast.error(error)
          }
    }


    const hendelSignin=()=>{
        setIslogin(true)
        let err= loginFromValidation()
        if (Object.keys(err).length === 0) {
            callGetBoard()
        } else {
            setIslogin(false)
            if(form.email == "" && form.pass == "" && form.subdo == ""){
                toast.error("Please fill the mandatory fields");
                return;
            }else if(form.email == ""){
                toast.error("Please enter a Email");
                return;
            }else if(form.pass == ""){
                toast.error("Please enter a Password");
                return;
            }else if(form.subdo == ""){
                toast.error("Please enter a Subdomain");
                return;
            }else{
                console.log("else block running");
            }
        }        
    }

    const login=async()=> {
        try {
          let Token=localStorage.getItem("gnb-token")
          let data = JSON.stringify({"app_board":form.sub.toLowerCase(),  "user_email":form.email , "user_password":form.pass,    "app_token": Token,      "app_uuid": 0,      "language_code": "en",      "version_number": "1.0.16"    });
          const result = await getLogin(data);
          if(result.success){
            localStorage.setItem('user', JSON.stringify(result.response));
            setTimeout(()=>{
                setIslogin(false)
                history.push('/home')
            },3000)
          }else{
            toast.error(result.response)
          }         
          setIslogin(false)
        } catch (error) {
            toast.error(error)
            setIslogin(false)
        }
      }
          
    const loginFromValidation=()=>{       
        const newErrors= {}
        if (!form.email) {
            newErrors.email = "Please enter a valid email."
        }
        if (!form.pass) {
            newErrors.pass = "Please enter a password."
        }
        if (!form.sub) {
            newErrors.subdo = "Please enter a subdomain."
        }
        setErrors(newErrors)
        return newErrors
    }
   

    return (
        <div className="login_content">
            <div className='login_head'>
                <div className='logo_img'>
                    <img src="https://dev.globalnoticeboard.com/static_images/admin_images/gnb_main_logo.png?v=1" />
                </div>

                <h4 className='font_sm'>Hi there,</h4>
                <p className='des'><i>This allows you to fully edit your standard documents and send it back to your AMC</i></p>
            </div>
            <div className='login_form'>
                <h3 className='font_sm'>Login Here</h3>
                <div className='gnb_doc_form'>
                    <div className='form_field'>
                        <input style={{ borderColor: errors.email ? "#ff0000" : "" }} type="text" placeholder='GNB AMC - Email' name="email"  value={form.email} onChange={changeHandler} />

                    </div>
                    <div className='form_field'>
                        <input style={{ borderColor: errors.pass ? "#ff0000" : "" }} type="password" placeholder='GNB AMC - Password'  name="pass" value={form.pass} onChange={changeHandler} />
                    </div>
                    <div className='form_field'>
                        <input style={{ borderColor: errors.subdo ? "#ff0000" : "" }} type="text" placeholder='Your GNB Subdomain'  name="sub" value={form.sub} onChange={changeHandler} />
                    </div>
                    <div className='form_field'>
                       {islogin ?<button className='login_btn'>Loading...</button>:<button onClick={hendelSignin} className='login_btn'>Login</button>} 
                    </div>
                </div>
            </div>
            <p className='des_sm'><i>Please Note: You would need an account with GNB AMC to login and use this Add In, Please go to https://gnbproperty.com/ to get it touch and signup as an AMC user with us.</i></p>
      {pageLoading && <Loading/> } 
      <Toaster  position="top-center"
                reverseOrder={true} toastOptions={{
                  duration:2000,
                  className: '',
                  style: {
                   marginTop:'40px'
                  },
                }}  />

        </div>
    )
}
export default Login;