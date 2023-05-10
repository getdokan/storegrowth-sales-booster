import { useSelect } from '@wordpress/data';

function PageLoader() {
  const { loading } = useSelect((select) => ({
    loading: select('spsb').getPageLoading()
  }));

  return ( loading &&
    <div className="spsb-page-loader">
        <div className="spsb-page-loader-ring" />
    </div>
  );
}

export default PageLoader;
