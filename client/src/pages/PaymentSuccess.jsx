import React, { useEffect, useState } from 'react'
import { FiCheckCircle } from "react-icons/fi";
import { confirmCreditsPurchase, getCurrentUser } from '../services/api';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
function PaymentSuccess() {
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const [confirmationStatus,setConfirmationStatus]=useState("confirming")
    const [sessionId]=useState(()=>new URLSearchParams(window.location.search).get("session_id"))
    useEffect(()=>{
        let cancelled=false
        let timer
        const refreshUntilCredited=async()=>{
            if(!sessionId){
                setConfirmationStatus("failed")
                return
            }
            for(let attempt=0;attempt<15 && !cancelled;attempt++){
                const result=await confirmCreditsPurchase(sessionId)
                if(result?.paid){
                    await getCurrentUser(dispatch)
                    if(!cancelled) navigate("/")
                    return
                }
                await new Promise(resolve=>{ timer=setTimeout(resolve,2000) })
            }
            if(!cancelled) setConfirmationStatus("failed")
        }
        refreshUntilCredited()
        return ()=>{ cancelled=true; clearTimeout(timer) }
    },[dispatch,navigate,sessionId])
    return (
        <div className='min-h-screen flex flex-col items-center justify-center p-4 gap-4'>
            <div
                className="text-green-500 text-6xl">
                <FiCheckCircle />
            </div>

            <h1
                className="text-2xl font-bold text-green-600">
                {confirmationStatus === "confirming" ? "Payment received. Confirming your credits…" : "We couldn't confirm the payment yet."}
            </h1>
            <p
                className="text-gray-500 text-sm">
                {confirmationStatus === "confirming" ? "Please wait while we verify your payment." : "Refresh this page to try again. Your payment will not be credited twice."}
            </p>

        </div>
    )
}
export default PaymentSuccess
