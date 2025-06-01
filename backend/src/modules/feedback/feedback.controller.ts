import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { CreateFeedbackDto } from "./dto/create-feedback.dto";
import { FeedbackService } from "./service/feedback.service";

@ApiTags("feedback")
@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Submit user feedback" })
  @ApiBody({ type: CreateFeedbackDto })
  async createFeedback(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.createFeedback(dto);
  }

  @Get()
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Get user feedback history" })
  async getFeedbackHistory() {
    return this.feedbackService.getFeedbackHistory();
  }
}
