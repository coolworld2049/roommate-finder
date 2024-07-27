import Logo from "./Logo";
import NavMenu from "./NavMenu";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-row items-center justify-between p-1.5">
        <Logo />
        <NavMenu />
      </div>
    </header>
  );
};

export default Header;
