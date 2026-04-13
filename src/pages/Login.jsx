export default function Login(){
  const handle=()=>{
    window.location.href='https://cboi-auth-stage.isupay.in/application/o/merchant-web-application/'
  }
  return (
    <div className="h-screen flex items-center justify-center">
      <button onClick={handle} className="bg-blue-600 text-white px-6 py-3 rounded">
        Login with CBOI
      </button>
    </div>
  )
}
