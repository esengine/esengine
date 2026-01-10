import './_virtual_internal_constants-DWlew7Dp.js';

var TaskManager = function () {
  function TaskManager() {
    this.tasks = new Map();
    this.nextTaskId = 0;
  }
  var _proto = TaskManager.prototype;
  _proto.addTask = function addTask(task, taskId) {
    if (taskId === void 0) {
      taskId = null;
    }
    if (typeof taskId === 'number') {
      this.tasks.set(taskId, task);
    } else {
      this.tasks.set(this.getNextTaskId(), task);
    }
  };
  _proto.getNextTaskId = function getNextTaskId() {
    return this.nextTaskId++;
  };
  _proto.removeTask = function removeTask(taskId) {
    this.tasks["delete"](taskId);
  };
  return TaskManager;
}();
var GooglePlayTask = function () {
  function GooglePlayTask(task) {
    this._nativeTask = void 0;
    this._nativeTask = task;
  }
  var _proto2 = GooglePlayTask.prototype;
  _proto2.addOnCanceledListener = function addOnCanceledListener(listener) {
    var taskId = GooglePlayTask.taskMgr.getNextTaskId();
    var newNativeTask = this._nativeTask.addOnCanceledListener({
      onCanceled: function onCanceled() {
        listener.onCanceled();
        GooglePlayTask.taskMgr.removeTask(taskId);
      }
    });
    var newTask = new GooglePlayTask(newNativeTask);
    GooglePlayTask.taskMgr.addTask(newTask, taskId);
    return newTask;
  };
  _proto2.addOnCompleteListener = function addOnCompleteListener(listener) {
    var taskId = GooglePlayTask.taskMgr.getNextTaskId();
    var newNativeTask = this._nativeTask.addOnCompleteListener({
      onComplete: function onComplete(result) {
        listener.onComplete(new GooglePlayTask(result));
        GooglePlayTask.taskMgr.removeTask(taskId);
      }
    });
    var newTask = new GooglePlayTask(newNativeTask);
    GooglePlayTask.taskMgr.addTask(newTask, taskId);
    return newTask;
  };
  _proto2.addOnFailureListener = function addOnFailureListener(listener) {
    var taskId = GooglePlayTask.taskMgr.getNextTaskId();
    var newNativeTask = this._nativeTask.addOnFailureListener({
      onFailure: function onFailure(result) {
        listener.onFailure(result);
        GooglePlayTask.taskMgr.removeTask(taskId);
      }
    });
    var newTask = new GooglePlayTask(newNativeTask);
    GooglePlayTask.taskMgr.addTask(newTask, taskId);
    return newTask;
  };
  _proto2.addOnSuccessListener = function addOnSuccessListener(continuation) {
    var taskId = GooglePlayTask.taskMgr.getNextTaskId();
    var newNativeTask = this._nativeTask.addOnSuccessListener({
      onSuccess: function onSuccess(result) {
        continuation.onSuccess(result);
        GooglePlayTask.taskMgr.removeTask(taskId);
      }
    });
    var newTask = new GooglePlayTask(newNativeTask);
    GooglePlayTask.taskMgr.addTask(newTask, taskId);
    return newTask;
  };
  _proto2.continueWith = function continueWith(continuation) {
    var newNativeTask = this._nativeTask.continueWith({
      then: function then(result) {
        var newTask = new GooglePlayTask(result);
        GooglePlayTask.taskMgr.addTask(newTask);
        return continuation.then(newTask);
      }
    });
    var newTask = new GooglePlayTask(newNativeTask);
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  _proto2.continueWithTask = function continueWithTask(continuation) {
    throw new Error('Method not implemented.');
  };
  _proto2.getResult = function getResult() {
    var anyType = null;
    this._nativeTask.getResult({
      onSuccess: function onSuccess(result) {
        anyType = result;
      }
    });
    return anyType;
  };
  _proto2.isCanceled = function isCanceled() {
    return this._nativeTask.isCanceled();
  };
  _proto2.isComplete = function isComplete() {
    return this._nativeTask.isComplete();
  };
  _proto2.isSuccessful = function isSuccessful() {
    return this._nativeTask.isSuccessful();
  };
  return GooglePlayTask;
}();
GooglePlayTask.taskMgr = new TaskManager();
var GamesSignInClientHelper = function () {
  function GamesSignInClientHelper() {}
  var _proto3 = GamesSignInClientHelper.prototype;
  _proto3.isAuthenticated = function isAuthenticated() {
    var newTask = new GooglePlayTask(jsb.PlayGames.getGamesSignInClient().isAuthenticated());
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  _proto3.requestServerSideAccess = function requestServerSideAccess(serverClientId, forceRefreshToken) {
    var newTask = new GooglePlayTask(jsb.PlayGames.getGamesSignInClient().requestServerSideAccess(serverClientId, forceRefreshToken));
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  _proto3.signIn = function signIn() {
    var newTask = new GooglePlayTask(jsb.PlayGames.getGamesSignInClient().signIn());
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  return GamesSignInClientHelper;
}();
var AchievementsClientHelper = function () {
  function AchievementsClientHelper() {}
  var _proto4 = AchievementsClientHelper.prototype;
  _proto4.showAchievements = function showAchievements() {
    jsb.PlayGames.getAchievementsClient().showAchievements();
  };
  _proto4.incrementImmediate = function incrementImmediate(id, numSteps) {
    var newTask = new GooglePlayTask(jsb.PlayGames.getAchievementsClient().incrementImmediate(id, numSteps));
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  _proto4.load = function load(forceReload) {
    var newTask = new GooglePlayTask(jsb.PlayGames.getAchievementsClient().load(forceReload));
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  _proto4.revealImmediate = function revealImmediate(id) {
    var newTask = new GooglePlayTask(jsb.PlayGames.getAchievementsClient().revealImmediate(id));
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  _proto4.setStepsImmediate = function setStepsImmediate(id, numSteps) {
    var newTask = new GooglePlayTask(jsb.PlayGames.getAchievementsClient().setStepsImmediate(id, numSteps));
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  _proto4.unlockImmediate = function unlockImmediate(id) {
    var newTask = new GooglePlayTask(jsb.PlayGames.getAchievementsClient().unlockImmediate(id));
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  _proto4.increment = function increment(id, numSteps) {
    jsb.PlayGames.getAchievementsClient().increment(id, numSteps);
  };
  _proto4.reveal = function reveal(id) {
    jsb.PlayGames.getAchievementsClient().reveal(id);
  };
  _proto4.setSteps = function setSteps(id, numSteps) {
    jsb.PlayGames.getAchievementsClient().setSteps(id, numSteps);
  };
  _proto4.unlock = function unlock(id) {
    jsb.PlayGames.getAchievementsClient().unlock(id);
  };
  return AchievementsClientHelper;
}();
var RecallClientHelper = function () {
  function RecallClientHelper() {}
  var _proto5 = RecallClientHelper.prototype;
  _proto5.requestRecallAccess = function requestRecallAccess() {
    var newTask = new GooglePlayTask(jsb.PlayGames.getRecallClient().requestRecallAccess());
    GooglePlayTask.taskMgr.addTask(newTask);
    return newTask;
  };
  return RecallClientHelper;
}();
var PlayGamesHelper = function () {
  function PlayGamesHelper() {}
  PlayGamesHelper.getAchievementsClient = function getAchievementsClient() {
    return this.achievementsClient;
  };
  PlayGamesHelper.getGamesSignInClient = function getGamesSignInClient() {
    return this.gamesSignInClient;
  };
  PlayGamesHelper.getRecallClient = function getRecallClient() {
    return this.recallClient;
  };
  return PlayGamesHelper;
}();
PlayGamesHelper.achievementsClient = new AchievementsClientHelper();
PlayGamesHelper.gamesSignInClient = new GamesSignInClientHelper();
PlayGamesHelper.recallClient = new RecallClientHelper();

var _globalThis$jsb;
var ns = (_globalThis$jsb = globalThis.jsb) !== null && _globalThis$jsb !== void 0 ? _globalThis$jsb : {};
var google;
(function (_google) {
  var billing;
  (function (_billing) {
    _billing.BillingClient = ns.BillingClient;
    _billing.BillingResult = ns.BillingResult;
    _billing.InAppMessageResult = ns.InAppMessageResult;
    _billing.ProductDetails = ns.ProductDetails;
    _billing.Purchase = ns.Purchase;
    _billing.PendingPurchasesParams = ns.PendingPurchasesParams;
    _billing.QueryProductDetailsParams = ns.QueryProductDetailsParams;
    _billing.BillingFlowParams = ns.BillingFlowParams;
    _billing.ConsumeParams = ns.ConsumeParams;
    _billing.AcknowledgePurchaseParams = ns.AcknowledgePurchaseParams;
    _billing.QueryPurchasesParams = ns.QueryPurchasesParams;
    _billing.GetBillingConfigParams = ns.GetBillingConfigParams;
    _billing.InAppMessageParams = ns.InAppMessageParams;
  })(billing || (billing = _google.billing || (_google.billing = {})));
  var play;
  (function (_play) {
    _play.PlayGamesSdk = ns.PlayGamesSdk;
    _play.PlayGames = PlayGamesHelper;
    _play.GamesSignInClient = GamesSignInClientHelper;
    _play.AchievementsClient = AchievementsClientHelper;
    _play.RecallClient = RecallClientHelper;
    _play.AuthenticationResult = ns.AuthenticationResult;
    _play.RecallAccess = ns.RecallAccess;
    _play.PlayException = ns.PlayException;
    _play.AnnotatedData = ns.AnnotatedData;
    _play.AchievementBuffer = ns.AchievementBuffer;
    _play.Achievement = ns.Achievement;
  })(play || (play = _google.play || (_google.play = {})));
})(google || (google = {}));

export { google };
//# sourceMappingURL=vendor-google.js.map
