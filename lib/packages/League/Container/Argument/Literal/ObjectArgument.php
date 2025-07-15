<?php

declare(strict_types=1);

namespace STOREGROWTH\SPSB\ThirdParty\Packages\League\Container\Argument\Literal;

use STOREGROWTH\SPSB\ThirdParty\Packages\League\Container\Argument\LiteralArgument;

class ObjectArgument extends LiteralArgument
{
    public function __construct(object $value)
    {
        parent::__construct($value, LiteralArgument::TYPE_OBJECT);
    }
}
