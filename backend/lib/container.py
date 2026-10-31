from typing import ClassVar

from dependency_injector import containers, providers

from backend.lib.logger_setup import logger
from backend.services.image_feed_service import ImageFeedService
from backend.services.settings_service import DisplaySettingsService
from backend.services.slideshow_service import SlideshowService
from backend.workers.image_feed_worker import ImageFeedWorker
from backend.workers.slideshow_worker import SlideshowWorker


# Used for DI, keeps all the application components and their dependencies
class Container(containers.DeclarativeContainer):
    """
    Wire all modules inside the specified packages so they can use @inject and Provide[] for dependency injection
    if we wanted to wire the whole app we could do 'packages=["backend"]' then every subdirectory would need a
    '__init__.py' file for its modules to get wired
    """
    wiring_config = containers.WiringConfiguration(packages=["backend.api", "backend.services"])

    slideshow_worker = providers.ThreadSafeSingleton(SlideshowWorker)
    image_feed_worker = providers.ThreadSafeSingleton(ImageFeedWorker)
    display_settings_service = providers.ThreadSafeSingleton(DisplaySettingsService)
    slideshow_service = providers.ThreadSafeSingleton(SlideshowService)
    image_feed_service = providers.ThreadSafeSingleton(ImageFeedService)

    services_to_initialize_on_startup: ClassVar[dict[str, providers.ThreadSafeSingleton]] = {
        "display_settings_service": display_settings_service,
        "slideshow_service": slideshow_service,
        "image_feed_service": image_feed_service
    }

    @classmethod
    def initialise_singletons(cls, container):
        for name in cls.services_to_initialize_on_startup:
            logger.info(f"Initialising singleton service: {name}")
            """
            We must get the service from the container,
            otherwise calling the provider directly will result in multiple instances
            """
            service = getattr(container, name)
            service()
