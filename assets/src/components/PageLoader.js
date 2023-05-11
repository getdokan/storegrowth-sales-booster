import { useSelect } from '@wordpress/data';

function PageLoader() {
  const { loading } = useSelect((select) => ({
    loading: select('storepulse_sales_booster').getPageLoading()
  }));

  return ( loading &&
    <div className="storepulse_sales_booster-page-loader">
        <div className="storepulse_sales_booster-page-loader-ring" />
    </div>
  );
}

export default PageLoader;
