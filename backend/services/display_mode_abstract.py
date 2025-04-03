from abc import ABC, abstractmethod

from dependency_injector.wiring import Provide, inject

from backend.models.display_model import DisplaySettings
from backend.services.settings_service import DisplaySettingsService


class ModeAbstract(ABC):
    display_settings_service: DisplaySettingsService

    @inject
    def __init__(self, display_settings_service: DisplaySettingsService = Provide["display_settings_service"]):
        self.display_settings_service = display_settings_service
        self.display_settings_service.subscribe(self.on_settings_update)

    @abstractmethod
    def on_settings_update(self, settings: DisplaySettings):
        pass
