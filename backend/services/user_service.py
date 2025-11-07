from repositories.user_repo import UserRepository


class UserService:
    def __init__(self,db):
         self.repo=UserRepository(db)
    
    def get_list_by_role(self,role):
        coachers=self.repo.get_all_by_role(role)
        return coachers