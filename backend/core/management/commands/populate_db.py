from django.core.management.base import BaseCommand
from core.models import Organization, Project
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Populates the database with initial Organization and Project data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database population...'))

        orgs = [
            "Acme Corp", "Globex Corporation", "Soylent Corp", 
            "Initech", "Umbrella Corp", "Stark Industries", 
            "Wayne Enterprises", "Cyberdyne Systems", 
            "Massive Dynamic", "Aperture Science"
        ]

        for name in orgs:
            slug = slugify(name)
            org, created = Organization.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'contact_email': f"contact@{slug}.com"
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Organization: {name}'))
                # Create a default project for each new organization
                Project.objects.create(
                    name=f"{name} Website Redesign",
                    organization=org,
                    description=f"Overhaul of the {name} main website.",
                    status="ACTIVE"
                )
                self.stdout.write(self.style.SUCCESS(f'  - Created Project: {name} Website Redesign'))
            else:
                self.stdout.write(self.style.WARNING(f'Skipped Organization: {name} (Already exists)'))

        self.stdout.write(self.style.SUCCESS('Database population complete.'))
