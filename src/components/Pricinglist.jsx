import { check } from "../assets";
import { pricing } from "../constants/index";
import Button from "./Button";

const Pricinglist = () => {
  return (
    <div className="flex gap-[1rem] max-lg:flex-wrap">
      {pricing.map((item) => (
        <div
          key={item.id}
          className="w-[19rem] max-lg:w-full h-full px-6 bg-n-8 border-n-6 rounded-[2rem] lg:w-auto even:py-14 odd:my-4 [&>h4]:first:text-color-2 [&>h4]:even:text-color-1 [&>h4]:odd:text-color-3
          "
        >
          <h4 className="h4 md-4">{item.title}</h4>
          <p className="body-2 min-h-[4rem]">{item.description}</p>
          <div className="flex items-center h-[5.5rem] mb-6">
            {item.price && (
              <>
                <div className="h3">$</div>
                <div className="text-[5rem] leading-none font-bold">
                  {item.price}
                </div>
              </>
            )}
          </div>
          <Button
            className="w-full mb-6"
            white={!!item.price}
            // href={item.price ? "/pricing" : "mailto:victorsunday78@yahoo.com"}
          >
            {item.price ? "Get Started" : "Contact Us"}
          </Button>
          <ul>
            {item.features.map((feature, index) => (
              <li
                key={index}
                className="flex item-start py-5 border-t border-n-6 gap-[1rem]"
              >
                <img src={check} width={24} height={24} alt={check} />
                <p className="body-2 m">{feature}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
export default Pricinglist;
