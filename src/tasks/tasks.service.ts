import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {

    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository
    ){}

    async getTasks(
        filterDto: GetTasksFilterDto,
        user: User
        )  {
        return await this.taskRepository.getTask(filterDto, user);

    }
    
    async getTaskById(
        id: number,
        user: User,
        ): Promise<Task> {
        const found = await this.taskRepository.findOne({ where: { id, userId: user.id} });
        if(!found){
            throw new NotFoundException(`Task with ID =  "${id}" not found`);
        }
        return found;
    }

    async createTask(
        createDto: CreateTaskDto,
        user: User
    ): Promise<Task> {
        return this.taskRepository.createTask(createDto, user);
    }

    async deleteTask(id:number,  user: User):  Promise<any>{
        const result = await this.taskRepository.delete( { id, userId: user.id} );
        if(!result.affected){
            throw new NotFoundException(`Task with ID =  "${id}" not found`);
        }
        return result;
   }

   async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise <Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;
        await task.save();
        return task;
   }

}
