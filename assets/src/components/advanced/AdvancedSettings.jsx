import { useEffect, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { useDispatch } from "@wordpress/data";
import { Alert, Button, Card, Space, Switch, Typography, notification } from "antd";

const { Title, Text } = Typography;

/**
 * Global "Advanced" settings panel.
 *
 * Currently a single control: whether uninstalling the plugin removes all of
 * its data. Reads and writes the `sales-booster/v1/settings` REST route. The
 * setting defaults to off (preserve), so removing the plugin to troubleshoot
 * never deletes configuration unless the merchant explicitly opts in.
 */
function AdvancedSettings() {
  const { setPageLoading } = useDispatch("spsg");
  const [removeData, setRemoveData] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPageLoading(true);

    apiFetch({ path: "/sales-booster/v1/settings" })
      .then((res) => setRemoveData(!!res?.remove_data_on_uninstall))
      .catch(() => {})
      .finally(() => setTimeout(() => setPageLoading(false), 300));
  }, []);

  const onSave = () => {
    setSaving(true);

    apiFetch({
      path: "/sales-booster/v1/settings",
      method: "POST",
      data: { remove_data_on_uninstall: removeData },
    })
      .then((res) => {
        setRemoveData(!!res?.remove_data_on_uninstall);
        notification.success({
          message: __("Advanced settings", "storegrowth-sales-booster"),
          description: __(
            "Your settings were saved.",
            "storegrowth-sales-booster"
          ),
        });
      })
      .catch(() => {
        notification.error({
          message: __("Advanced settings", "storegrowth-sales-booster"),
          description: __(
            "Could not save your settings. Please try again.",
            "storegrowth-sales-booster"
          ),
        });
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="spsg-advanced-settings">
      <Card
        title={__("Advanced", "storegrowth-sales-booster")}
        style={{ maxWidth: 760, margin: "24px auto" }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div>
              <Title level={5} style={{ marginBottom: 4 }}>
                {__(
                  "Remove all data on uninstall",
                  "storegrowth-sales-booster"
                )}
              </Title>
              <Text type="secondary">
                {__(
                  "When enabled, deleting the plugin also deletes its tables, options and product data. Leave it off to keep your configuration if you remove the plugin temporarily.",
                  "storegrowth-sales-booster"
                )}
              </Text>
            </div>

            <Switch
              checked={removeData}
              onChange={setRemoveData}
              checkedChildren={__("On", "storegrowth-sales-booster")}
              unCheckedChildren={__("Off", "storegrowth-sales-booster")}
            />
          </div>

          {removeData && (
            <Alert
              type="warning"
              showIcon
              message={__("This is irreversible", "storegrowth-sales-booster")}
              description={__(
                "With this on, uninstalling the plugin permanently deletes all StoreGrowth data. It has no effect until you actually uninstall.",
                "storegrowth-sales-booster"
              )}
            />
          )}

          <div>
            <Button type="primary" loading={saving} onClick={onSave}>
              {__("Save changes", "storegrowth-sales-booster")}
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default AdvancedSettings;
