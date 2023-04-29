import { useSelect } from '@wordpress/data';

function PageLoader() {
  const { loading } = useSelect((select) => ({
    loading: select('sbfw').getPageLoading()
  }));

  return ( loading &&
    <div className="sbfw-page-loader">
        <div className="sbfw-page-loader-ring" />
    </div>
  );
}

export default PageLoader;
