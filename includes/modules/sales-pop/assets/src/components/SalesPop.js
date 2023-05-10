import {Tabs,Card, Button, Form } from 'antd';
const { TabPane } = Tabs;
import { useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Country, State, City }  from 'country-state-city';


function SalesPop({ outlet: Outlet, useSearchParams }) {
	const { setCreateFromData } = useDispatch( 'spsb_order_sales_pop' );
	const { setPageLoading } = useDispatch( 'spsb' );
	const { createPopupForm } = useSelect( ( select ) => ({
		createPopupForm: select('spsb_order_sales_pop').getCreateFromData()
	}));
	const layout = {
		labelCol: {
			span: 6,
		},
		wrapperCol: {
			span: 18,
		},
	};

	const tailLayout = {
		wrapperCol: {
			span: 16,
		},
	};

	useEffect(() => {
		
		setPageLoading( true );
				
		let $ = jQuery;
		$.post( sales_pop_data.ajax_url, { 
			'action'    : 'popup_products', 
		    'data'      : [] ,
			'_ajax_nonce' : sales_pop_data.ajd_nonce
		}, function (response) {
			const countriesBefore = Country.getAllCountries();
			const updatedCountries = countriesBefore.map((country) => ({
				label: country.name,
				value: country.isoCode
			}));
			setPageLoading( false );
			setCreateFromData(
				{
					...createPopupForm, ...response.data,
					countries:updatedCountries,
						
				}
			);
		});
	}, []);

	return (
		<Form {...layout}>
			<Card className='tab-pan-wrapper'>
				<Outlet/>
			</Card>
		</Form>
	);
  }
  
export default SalesPop;