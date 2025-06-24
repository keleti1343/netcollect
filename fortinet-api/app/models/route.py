from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, sql
from sqlalchemy.orm import relationship
from app.database import Base

class Route(Base):
    __tablename__ = "routes"

    route_id = Column(Integer, primary_key=True, index=True)
    vdom_id = Column(Integer, ForeignKey("vdoms.vdom_id", ondelete="CASCADE"), nullable=False)
    destination_network = Column(String, nullable=False)
    mask_length = Column(Integer, nullable=False)
    route_type = Column(String, nullable=False)
    gateway = Column(String, nullable=True)
    exit_interface_name = Column(String, nullable=False)
    exit_interface_details = Column(String, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())
    
    # Relationships
    vdom = relationship("VDOM", back_populates="routes")