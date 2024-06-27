import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from '../common/role.decorator';
import { OrderService } from './order.service';
import { Role } from '../common/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(Role.Admin)
  @UseGuards(RoleGuard)
  @Get()
  getAll() {
    return this.orderService.findAll();
  }
}
