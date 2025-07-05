export default async function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="w-full min-h-screen bg-gray-300 flex flex-col items-center justify-center">
          <div className="border-2 border-gray-500 shadow-lg rounded-lg p-5 bg-gray-200 min-h-[300px] grid place-items-center">
            <div className="w-[600px] overflow-auto mt-10">
              Could not find requested resource
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
