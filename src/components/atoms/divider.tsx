import { Else, If } from './if'

export default function Divider({
  children,
}: Readonly<{ children?: React.ReactNode }>) {
  return (
    <>
      <If condition={!!children}>
        <div className="flex items-center text-nowrap">
          <div className="border-2 border-black w-full rounded-full dark:border-white"></div>
          <span className="mx-2">{children}</span>
          <div className="border-2 border-black w-full rounded-full dark:border-white"></div>
        </div>
      </If>
      <Else>
        <div className="flex items-center text-nowrap">
          <div className="border-2 border-black w-full rounded-full dark:border-white"></div>
        </div>
      </Else>
    </>
  )
}
