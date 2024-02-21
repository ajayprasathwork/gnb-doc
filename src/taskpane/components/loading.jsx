import React, { ReactNode } from 'react';
import ReactLoading from "react-loading";

  
  export default function Loading() {
    return(
        <div  className="loading">
      
      <ReactLoading
                type="spinningBubbles"
                color="#529B50"
                height={70}
                width={50}
            />
        </div>
    ) 
  }