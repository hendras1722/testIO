import Link from 'next/link'
// import { headers } from 'next/headers'

export default async function NotFound() {
  // const headersList = await headers()
  // const domain = headersList.get('host')

  return (
    <div className="w-full min-h-screen bg-gray-300 flex flex-col items-center justify-center">
      {/* <h2>Not Found: {data.name}</h2> */}
      <div className="border-2 border-gray-500 shadow-lg rounded-lg p-5 bg-gray-200 h-[300px] grid place-items-center">
        <h1>Could not find requested resource</h1>
        <p className="text-center text-2xl">
          {/* <Button>
            <Link href={'/'}>Back</Link>
          </Button> */}
        </p>
      </div>
    </div>
  )
}
