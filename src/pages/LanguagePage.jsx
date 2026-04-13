import MainLayout from '../layout/MainLayout'
export default function LanguagePage(){
  return (
    <MainLayout>
      <h1>Language</h1>
      <select className="border p-2 mt-2">
        <option>English</option>
        <option>Hindi</option>
      </select>
      <button className="bg-blue-600 text-white px-4 py-2 mt-2">Update</button>
    </MainLayout>
  )
}
