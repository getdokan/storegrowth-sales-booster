<?php

namespace STOREGROWTH\SPSB;

use STOREGROWTH\SPSB\Interfaces\ModuleSkeleton;
use STOREGROWTH\SPSB\DependencyManagement\Container;

abstract class BaseModule implements ModuleSkeleton {

    protected $icon = '';

    protected $active_modules_option_key = 'sgsb_active_module_ids';

    protected function get_container(): Container {
        return storegrowth_get_container();
    }

    public function is_active(): bool {
        $data = $this->get_active_modules_option_data();

        return in_array( $this->get_id(), $data, true );
    }

    public function activate(): bool {
        $data = $this->get_active_modules_option_data();

        $data[] = $this->get_id();

        $activated = $this->update_active_modules_option_data( $data );

        $this->boot();

        do_action( 'sgsb_module_activated', $this->get_id() );

        return $activated;
    }

    public function deactivate(): bool {
        $data = $this->get_active_modules_option_data();

        $filter_data = array_filter(
            $data, function ( $module_id ) {
				return $module_id !== $this->get_id();
            }
        );

        do_action( 'sgsb_module_deactivated', $this->get_id() );

        return $this->update_active_modules_option_data( $filter_data );
    }

    public function get_icon(): string {
        return apply_filters( 'sgsb_module_icon', $this->icon, $this->get_id() );
    }

    protected function get_active_modules_option_data(): array {
        return (array) get_option( $this->active_modules_option_key, [] );
    }

    protected function update_active_modules_option_data( array $module_ids ): bool {
        $module_ids = array_unique( $module_ids );

        return update_option( $this->active_modules_option_key, array_filter( $module_ids ) );
    }
}
