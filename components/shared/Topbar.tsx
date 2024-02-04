import { OrganizationSwitcher, SignOutButton, SignedIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import Image from "next/image"
import Link from "next/link"

function Topbar() {
  return (
    <nav className="topbar">
      <Link className=" flex items-center gap-1" href={""}>
        <Image src={"/assets/logo3.png"} alt={"logo"} width={28} height={28} />
        <p className="texx-heading3-bold text-light-1 max-xs:hidden">Palestino</p>
      </Link>
      <div className="flex items-center gap-3">
        <div className="block md:hidden">
          <SignedIn>
            <SignOutButton>
              <div className="cursor-pointer flex">
                <Image src={"/assets/logout.svg"} alt={"logout"} width={24} height={24} />
              </div>
            </SignOutButton>
          </SignedIn>
        </div>
        <OrganizationSwitcher
          appearance={{
            baseTheme: dark,
            elements: {
              organizationSwitcherTrigger: 'py-2 px-4'
            }
          }}
        />
      </div>

    </nav>
  )
}

export default Topbar