import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ClickOutside from "@/components/ClickOutside";
import { FiLogOut } from "react-icons/fi";
import { getPayload } from "@/lib/tokenManager";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const payload = getPayload();
    if (payload) {
      setUserEmail(payload.sub);
      setUserRole(payload.role);
    }
  }, []);

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        href="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {userEmail || "User"}
          </span>
          <span className="block text-xs">{userRole || "Role"}</span>
        </span>

        <span className="h-12 w-12 rounded-full">
          <Image
            width={112}
            height={112}
            src={"/images/user/user.png"}
            style={{
              width: "auto",
              height: "auto",
            }}
            alt="User"
          />
        </span>
        <Link
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-4"
          href="/logout"
        >
          <FiLogOut className="w-5 h-5" />
        </Link>
      </Link>
    </ClickOutside>
  );
};

export default DropdownUser;