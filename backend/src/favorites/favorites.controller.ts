import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post(':instructorProfileId')
  async addFavorite(@Request() req, @Param('instructorProfileId') id: string) {
    return this.favoritesService.addFavorite(req.user.id, id);
  }

  @Delete(':instructorProfileId')
  async removeFavorite(
    @Request() req,
    @Param('instructorProfileId') id: string,
  ) {
    return this.favoritesService.removeFavorite(req.user.id, id);
  }

  @Get('my')
  async getMyFavorites(@Request() req) {
    return this.favoritesService.getMyFavorites(req.user.id);
  }

  @Get('check/:instructorProfileId')
  async checkFavorited(
    @Request() req,
    @Param('instructorProfileId') id: string,
  ) {
    const isFavorited = await this.favoritesService.isFavorited(
      req.user.id,
      id,
    );
    return { isFavorited };
  }
}
