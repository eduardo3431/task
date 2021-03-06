import { Controller, Body, Param, Get, Post, Delete, Put, Patch, Query, UsePipes, ValidationPipe, ParseIntPipe, UseGuards, Logger } from '@nestjs/common'
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('TasksController');
    constructor(private tasksService: TasksService){}

    @Get()
    getTask(
        @Query(ValidationPipe) filterDto: GetTasksFilterDto,
        @GetUser() user: User
        ): Promise<Task[]> {
        this.logger.verbose(`User "${user.username}" retrieving all task. Filters: ${JSON.stringify(filterDto)}`);
        return this.tasksService.getTasks(filterDto, user);
    } 

    @Get('/:id')
    getTaskById(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
        ): Promise<Task> {
        return this.tasksService.getTaskById(id, user);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(
        @Body() CreateTaskDto: CreateTaskDto,
        @GetUser() user: User

    ): Promise<Task> {
        this.logger.verbose(`User "${user.username}" creating a new task. Data ${JSON.stringify(CreateTaskDto)}`);
        return this.tasksService.createTask(CreateTaskDto, user);
    }

    @Delete('/:id') 
    deleteTask(@Param('id', ParseIntPipe) id:number, @GetUser() user: User): Promise<any> {
        return this.tasksService.deleteTask(id, user);
    }

    @Patch('/:id/status')
    updateTaskStatus(
        @Param('id', ParseIntPipe) id: number, 
        @Body('status', TaskStatusValidationPipe) status: TaskStatus,
        @GetUser() user: User,
        ): Promise<Task> {
        return this.tasksService.updateTaskStatus(id, status, user);
    }

}
