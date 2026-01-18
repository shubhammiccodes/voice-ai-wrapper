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

schema = graphene.Schema(query=Query)
