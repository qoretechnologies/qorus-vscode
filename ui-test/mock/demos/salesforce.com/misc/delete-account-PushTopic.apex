List<PushTopic> pts = [SELECT Id FROM PushTopic WHERE Name = 'AccountUpdates'];
Database.delete(pts);
