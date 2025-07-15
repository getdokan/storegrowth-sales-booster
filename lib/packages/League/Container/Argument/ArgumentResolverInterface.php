<?php

declare(strict_types=1);

namespace STOREGROWTH\SPSB\ThirdParty\Packages\League\Container\Argument;

use STOREGROWTH\SPSB\ThirdParty\Packages\League\Container\ContainerAwareInterface;
use ReflectionFunctionAbstract;

interface ArgumentResolverInterface extends ContainerAwareInterface
{
    public function resolveArguments(array $arguments): array;
    public function reflectArguments(ReflectionFunctionAbstract $method, array $args = []): array;
}
