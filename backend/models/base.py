class BaseModel:
    """Base model class for all data models"""
    
    @classmethod
    def get_all(cls):
        """
        Simulates fetching all records from a database
        In a real implementation, this would query a database
        """
        return cls.dummy_data
    
    @classmethod
    def get_by_id(cls, id):
        """
        Simulates fetching a record by ID
        In a real implementation, this would query a database with a WHERE clause
        """
        for item in cls.dummy_data:
            if item.get('id') == id:
                return item
        return None