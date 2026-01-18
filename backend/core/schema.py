import graphene
from graphene_django import DjangoObjectType
from .models import Organization, Project, Task, TaskComment

class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = "__all__"

class ProjectType(DjangoObjectType):
    class Meta:
        model = Project
        fields = "__all__"

    task_count = graphene.Int()
    completion_percentage = graphene.Int()

    def resolve_task_count(self, info):
        return self.tasks.count()

    def resolve_completion_percentage(self, info):
        total = self.tasks.count()
        if total == 0:
            return 0
        completed = self.tasks.filter(status="DONE").count()
        return int((completed / total) * 100)

class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = "__all__"

class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = "__all__"

class Query(graphene.ObjectType):
    all_organizations = graphene.List(OrganizationType)
    all_projects = graphene.List(ProjectType, organization_slug=graphene.String())
    project_by_id = graphene.Field(ProjectType, id=graphene.ID(required=True))
    
    def resolve_all_organizations(self, info):
        return Organization.objects.all()

    def resolve_all_projects(self, info, organization_slug=None):
        if organization_slug:
            return Project.objects.filter(organization__slug=organization_slug)
        return Project.objects.all()

    def resolve_project_by_id(self, info, id):
        try:
            return Project.objects.get(pk=id)
        except Project.DoesNotExist:
            return None


# --- MUTATIONS ---

class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        organization_id = graphene.ID(required=True)
        description = graphene.String()

    project = graphene.Field(ProjectType)

    def mutate(self, info, name, organization_id, description=None):
        try:
            org = Organization.objects.get(pk=organization_id)
            project = Project.objects.create(
                name=name,
                organization=org,
                description=description or ""
            )
            return CreateProject(project=project)
        except Organization.DoesNotExist:
            raise Exception("Organization not found")

class UpdateProject(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()

    project = graphene.Field(ProjectType)

    def mutate(self, info, project_id, name=None, description=None, status=None):
        try:
            project = Project.objects.get(pk=project_id)
            if name:
                project.name = name
            if description:
                project.description = description
            if status:
                project.status = status
            project.save()
            return UpdateProject(project=project)
        except Project.DoesNotExist:
            raise Exception("Project not found")

class CreateTask(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        project_id = graphene.ID(required=True)
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()

    task = graphene.Field(TaskType)

    def mutate(self, info, title, project_id, description=None, status="TODO", assignee_email=None):
        try:
            project = Project.objects.get(pk=project_id)
            task = Task.objects.create(
                title=title,
                project=project,
                description=description or "",
                status=status,
                assignee_email=assignee_email
            )
            return CreateTask(task=task)
        except Project.DoesNotExist:
            raise Exception("Project not found")

class UpdateTask(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()

    task = graphene.Field(TaskType)

    def mutate(self, info, task_id, title=None, description=None, status=None, assignee_email=None):
        try:
            task = Task.objects.get(pk=task_id)
            if title:
                task.title = title
            if description:
                task.description = description
            if status:
                task.status = status
            if assignee_email:
                task.assignee_email = assignee_email
            task.save()
            return UpdateTask(task=task)
        except Task.DoesNotExist:
            raise Exception("Task not found")

class UpdateTaskStatus(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        status = graphene.String(required=True)

    task = graphene.Field(TaskType)

    def mutate(self, info, task_id, status):
        try:
            task = Task.objects.get(pk=task_id)
            task.status = status
            task.save()
            return UpdateTaskStatus(task=task)
        except Task.DoesNotExist:
            raise Exception("Task not found")

class CreateComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, task_id, content, author_email):
        try:
            task = Task.objects.get(pk=task_id)
            comment = TaskComment.objects.create(
                task=task,
                content=content,
                author_email=author_email
            )
            return CreateComment(comment=comment)
        except Task.DoesNotExist:
            raise Exception("Task not found")


class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    update_task_status = UpdateTaskStatus.Field()
    create_comment = CreateComment.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
