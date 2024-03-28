import { Collapse, Space } from 'antd';

const ExpandPanels = ( { panels } ) => {
    return (
        <>
            { panels && panels?.length > 0 && (
                <Space
                    size={ [0, 20] }
                    direction='vertical'
                    style={{ width: '100%', marginBottom: 100 }}
                >
                    { panels?.map( panel => (
                        <Collapse
                            key={panel.key}
                            items={ [ panel ] }
                            collapsible='header'
                            expandIconPosition={ 'end' }
                            defaultActiveKey={ panel?.key }
                            className={ `sgsb-collapse-settings` }
                            expandIcon={ () => (
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path opacity="0.8" fillRule="evenodd" clipRule="evenodd" d="M11.7301 7.01365C11.4119 7.27882 10.939 7.23583 10.6738 6.91762L7.21026 2.76135C6.71051 2.16166 5.78945 2.16166 5.2897 2.76135L1.82615 6.91762C1.56097 7.23583 1.08805 7.27882 0.769843 7.01365C0.451635 6.74848 0.408643 6.27555 0.673816 5.95734L4.13737 1.80107C5.23681 0.481751 7.26315 0.481748 8.36259 1.80107L11.8261 5.95734C12.0913 6.27555 12.0483 6.74847 11.7301 7.01365Z" fill="#073B4C"/>
                                </svg>
                            ) }
                        />
                    ) ) }
                </Space>
            ) }
        </>
    );
}

export default ExpandPanels;
