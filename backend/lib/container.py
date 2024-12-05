from backend.workers.slideshow_worker import SlideshowWorker
from dependency_injector import containers, providers
from backend.services.display_service import DisplayService


# Used for DI, keeps all of the application components and their dependencies


class Container(containers.DeclarativeContainer):
  # wire all modules inside the specified packages so they can use @inject and Provide[] for dependency injection
  # if we wanted to wire the whole app we could do "packages=["backend"]"
  # then every sub-directory would need a "__init__.py" file for it's modules to get wired
  wiring_config = containers.WiringConfiguration(
    packages=["backend.api", "backend.services"])
  slideshow_worker = providers.ThreadSafeSingleton(SlideshowWorker)
  display_service = providers.ThreadSafeSingleton(
    DisplayService, slideshow_worker=slideshow_worker)
