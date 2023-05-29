import { useSelect } from '@wordpress/data';

function PageLoader() {
  const { loading } = useSelect((select) => ({
    loading: select('sgsb').getPageLoading()
  }));

  return ( loading &&
    <div className="sgsb-page-loader">
        <div className="sgsb-page-loader-ring" />
    </div>
  );
}

export default PageLoader;
