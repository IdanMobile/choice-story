// XXX NOT USED ANYMORE
import Link from 'next/link';
import Image from "next/image";

export default function Logo() {
  return (
    <div className="logo">
      <Link href="/">
      <Image
          className="dark:invert"
          src="/landing-page-images/logo-v2.svg"
          alt="ChoiceStory logo"
          width={180}
          height={48}
          priority
        />
      </Link>
    </div>
  );
};