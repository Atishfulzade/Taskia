import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Lock,
  Mail,
  Plus,
  Share2,
  Users,
  X,
  Check,
  LinkIcon,
  UserPlus,
  Shield,
  Eye,
  Edit2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useProjectMembers from "@/hooks/useProjectMembers";
import requestServer from "@/utils/requestServer";
import generateEmailTemplate from "@/utils/emailTemplate";
import { useSelector } from "react-redux";

const ShareDialog = ({ open, onOpenChange, resource, resourceType }) => {
  const [permission, setPermission] = useState("view");

  // Then use it in shareLink initialization
  const [shareLink, setShareLink] = useState(
    `${window.location.origin}/task/${resource.customId}#${permission}`
  );
  const [emails, setEmails] = useState([]);
  const [inputEmail, setInputEmail] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  const userName = useSelector((state) => state.user.user?.name);
  const { members } = useProjectMembers(resource.projectId);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      toast.success("Link copied to clipboard");

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleAddEmail = (e) => {
    e.preventDefault();
    if (!inputEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emails.includes(inputEmail)) {
      toast.error("Email already added");
      return;
    }

    setEmails([...emails, inputEmail]);
    setInputEmail("");
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleShare = async () => {
    try {
      // Validate there are recipients
      if (activeTab === "email" && emails.length === 0) {
        toast.error("Please add at least one email address");
        return;
      }

      const emailHtml = generateEmailTemplate({
        resourceType,
        resourceTitle: resource.title,
        shareLink,
        permission,
        senderName: userName,
      });

      // For email tab - send to specific recipients
      if (activeTab === "email") {
        // First add collaborators to the task
        await Promise.all(
          emails.map(async (email) => {
            await requestServer(`task/${resource._id}/collaborators`, {
              email,
              permission,
            });
          })
        );

        // Then send emails
        await requestServer("mail", {
          to: emails,
          subject: `Invitation to collaborate on ${resourceType}: ${resource.title}`,
          text: `You've been invited to collaborate on ${resourceType} "${resource.title}". Access it here: ${shareLink}`,
          html: emailHtml,
        });
      } else if (activeTab === "link") {
        // Add share link to the task
        await requestServer(`task/${resource._id}/share-links`, {
          link: shareLink,
          permission,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        });

        handleCopyLink();
      }

      toast.success(
        activeTab === "email"
          ? "Invitations sent successfully"
          : "Share link created and copied to clipboard"
      );
      setEmails([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Sharing error:", error);
      toast.error("Failed to share. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Share2 className="h-5 w-5" />
              Share {resourceType}
            </DialogTitle>
            <DialogDescription className="text-violet-100 opacity-90">
              Invite people to collaborate on "{resource.title}"
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Tabs
            defaultValue="email"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-violet-50 dark:bg-violet-900/20 p-1 rounded-lg">
              <TabsTrigger
                value="email"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-violet-800 data-[state=active]:text-violet-700 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite People</span>
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-violet-800 data-[state=active]:text-violet-700 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Get Link</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-violet-500" />
                  Add people by email
                </label>
                <form onSubmit={handleAddEmail} className="flex gap-2">
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    className="flex-1 border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="submit"
                          size="icon"
                          className="bg-violet-100 hover:bg-violet-200 text-violet-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add email</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </form>
              </div>

              {emails.length > 0 && (
                <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg space-y-2">
                  <div className="text-sm font-medium text-violet-800 dark:text-violet-200 mb-2">
                    Recipients ({emails.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {emails.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="flex items-center gap-1 bg-white dark:bg-violet-800 text-violet-700 dark:text-violet-200 border border-violet-200 dark:border-violet-700 py-1.5 pl-2 pr-1"
                      >
                        <span className="text-sm">{email}</span>
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="ml-1 hover:bg-violet-100 dark:hover:bg-violet-700 rounded-full p-0.5"
                          aria-label={`Remove ${email}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg space-y-3">
                <div className="text-sm font-medium text-violet-800 dark:text-violet-200 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permission level
                </div>
                <Select
                  value={permission}
                  onValueChange={(value) => {
                    setPermission(value);
                    setShareLink(
                      `${window.location.origin}/task/${resource.customId}#${value}`
                    );
                  }}
                >
                  <SelectTrigger className="w-full border-violet-200 focus:ring-violet-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-violet-500" />
                        <div>
                          <div className="font-medium">Can view</div>
                          <div className="text-xs text-gray-500">
                            Can view but not edit
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex items-center gap-2">
                        <Edit2 className="h-4 w-4 text-violet-500" />
                        <div>
                          <div className="font-medium">Can edit</div>
                          <div className="text-xs text-gray-500">
                            Can make changes
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-5">
              <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-800 flex items-center justify-center">
                    <LinkIcon className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Share via link</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Anyone with the link can {permission}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-violet-800/50 p-2 rounded-md border border-violet-200 dark:border-violet-700">
                  <div className="truncate flex-1 text-sm text-gray-600 dark:text-gray-300 px-2">
                    {shareLink}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className={`gap-2 transition-all ${
                      isCopied
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-800 dark:text-violet-200"
                        : "border-violet-200"
                    }`}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {isCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg space-y-3">
                <div className="text-sm font-medium text-violet-800 dark:text-violet-200 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permission level
                </div>
                <Select
                  value={permission}
                  onValueChange={(value) => {
                    setPermission(value);
                    setShareLink(
                      `${window.location.origin}/task/${resource.customId}#${value}`
                    );
                  }}
                >
                  <SelectTrigger className="w-full border-violet-200 focus:ring-violet-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-violet-500" />
                        <div>
                          <div className="font-medium">Can view</div>
                          <div className="text-xs text-gray-500">
                            Can view but not edit
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex items-center gap-2">
                        <Edit2 className="h-4 w-4 text-violet-500" />
                        <div>
                          <div className="font-medium">Can edit</div>
                          <div className="text-xs text-gray-500">
                            Can make changes
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {members.length > 0 && (
            <div className="space-y-3 mt-6 border-t border-gray-200 dark:border-gray-700 pt-5">
              <h4 className="text-sm font-medium flex items-center gap-2 text-violet-800 dark:text-violet-200">
                <Users className="h-4 w-4 text-violet-500" />
                People with access ({members.length})
              </h4>
              <div className="space-y-1 max-h-[180px] overflow-y-auto pr-2 -mr-2">
                {members.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2 px-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-sm">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-800 dark:text-violet-200">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-200"
                      >
                        {user.role}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remove access</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Lock className="h-4 w-4 mr-1.5 text-violet-500" />
            Only people with access can see this
          </div>
          <Button
            onClick={handleShare}
            disabled={activeTab === "email" && emails.length === 0}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {activeTab === "email" ? "Send invites" : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
