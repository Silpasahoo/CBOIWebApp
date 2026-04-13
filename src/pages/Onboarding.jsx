import MainLayout from '../layout/MainLayout'
export default function Onboarding(){
  return (
    <MainLayout>
      <h1>Onboarding</h1>
      <input className="border p-2 mt-2" placeholder="Mobile"/>
      <button className="bg-green-600 text-white px-4 py-2 mt-2">Submit</button>
    </MainLayout>
  )
}
