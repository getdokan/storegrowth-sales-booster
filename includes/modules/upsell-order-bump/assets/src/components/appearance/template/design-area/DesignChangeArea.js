import OverviewBox from './OverviewBox';
import DiscountSection from './DiscountSection';
import ProductSelection from './ProductSelection';
import AcceptOfferSection from './AcceptOfferSection';
import OfferDescriptionSection from './OfferDescriptionSection';

function DesignChangeArea() {

  return (

        <div className='demo-template-design-change-area'>
            <OverviewBox/>
            <DiscountSection/>
            <ProductSelection/>
            {/* <AcceptOfferSection/> */}
            {/* <OfferDescriptionSection/> */}
        </div>

  );
};

export default DesignChangeArea;