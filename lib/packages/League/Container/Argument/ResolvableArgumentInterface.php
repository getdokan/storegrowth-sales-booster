<?php

declare(strict_types=1);

namespace STOREGROWTH\SPSB\ThirdParty\Packages\League\Container\Argument;

interface ResolvableArgumentInterface extends ArgumentInterface
{
    public function getValue(): string;
}
