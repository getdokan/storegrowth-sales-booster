import { useSelect } from '@wordpress/data';

function PageLoader() {
  const { loading } = useSelect((select) => ({
    loading: select('spsg').getPageLoading()
  }));

  return ( loading &&
    <div className="spsg-page-loader">
        <div className="spsg-page-loader-ring" />
    </div>
  );
}

export default PageLoader;
