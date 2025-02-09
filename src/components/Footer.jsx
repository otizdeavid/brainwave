import Section from "./Section";
import { socials } from "../constants";
const Footer = () => {
  return (
    <Section className="!px-0 !py-10" crosses>
      <div className="container flex sm:justify-between justify-center items-center gap-10 max-sm:flex-col">
        <p className="caption text-n-4 lg:block">
          {new Date().getFullYear()} &copy; OtizDeAvid All rights reserved.
        </p>
        <ul className="flex gap-5 flex-wrap">
          {socials.map((items) => (
            <a
              href={items.url}
              className="flex items-center justify-center w-10 h-10 bg-n-7 rounded-full transition-colors hover:bg-n-6 "
              key={items.id}
              target="_blank"
            >
              <img
                src={items.iconUrl}
                width={16}
                height={16}
                alt={items.title}
              />
            </a>
          ))}
        </ul>
      </div>
    </Section>
  );
};
export default Footer;
