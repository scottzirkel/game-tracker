import Link from 'next/link';

export default function Home() {
  return (
    <div className="uppercase flex flex-col h-screen justify-center items-between *:w-full">
      <header className="basis-1/5 text-center py-12">
        <div>Round X</div>
        <div className="mt-4 space-x-4">
          <Link href="/battle" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Vertical Battle Tracker
          </Link>
          <Link href="/mechanicus" className="inline-block px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
            Horizontal Battle Tracker
          </Link>
          <Link href="/scoreboard" className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
            Scoreboard
          </Link>
          <Link href="/overwatch" className="inline-block px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
            Overwatch
          </Link>
        </div>
      </header>
      <div className="basis-3/5 flex flex-col justify-center">
        <div className="flex gap-42">
          <div className="flex-1 relative space-y-12">
            <div className="absolute left-0 -top-12 bg-white shadow-xl text-slate-900 p-4 text-center border-2 border-slate-700">
              X
              <br />
              Command
              <br />
              Points
            </div>
            <div className="bg-white p-4 text-slate-900 grid grid-cols-4">
              <div></div>
              <div className="col-span-2 text-right">
                <h3 className="text-2xl font-bold">Name</h3>
                <br />
                detatchment
              </div>
              <div className="ml-8">
                X
                <br />
                Victory Points
              </div>
            </div>
            <div>secondary</div>
          </div>
          <div className="flex-1 relative space-y-12">
            <div className="absolute right-0 -top-12 bg-teal-800 shadow-xl text-slate-900 p-4 text-center border-2 border-slate-700">
              X
              <br />
              Command
              <br />
              Points
            </div>
            <div className="bg-teal-700 p-4 grid grid-cols-4">
              <div className="mr-8">
                X
                <br />
                Victory Points
              </div>
              <div className="col-span-2">
                name
                <br />
                detatchment
              </div>
              <div></div>
            </div>
            <div className="text-right bg-teal-900">secondary</div>
          </div>
        </div>
      </div>
      <div className="basis-1/5 text-center">footer</div>
    </div>
  );
}
