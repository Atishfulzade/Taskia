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
  Globe,
  Lock,
  Mail,
  Plus,
  Share2,
  Users,
  X,
  Check,
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
  const { members } = useProjectMembers(resource.id);

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
        await requestServer("mail", {
          to: emails, // This should be an array of valid emails
          subject: `Invitation to collaborate on ${resourceType}: ${resource.title}`,
          text: `You've been invited to collaborate on ${resourceType} "${resource.title}". Access it here: ${shareLink}`,
          html: emailHtml,
        });
      }
      if (activeTab === "link") {
        await requestServer(`tasks/${resource.id}/share-links`, {
          method: "POST",
          body: {
            link: shareLink,
            permission,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        });
      } else {
        handleCopyLink();
      }

      toast.success(
        activeTab === "email"
          ? "Invitations sent successfully"
          : "Link copied to clipboard"
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-teal-500" />
            Share {resourceType}
          </DialogTitle>
          <DialogDescription>
            Invite people to collaborate on this {resourceType}.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="email"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>Email Invite</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>Share Link</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleAddEmail} className="flex gap-2">
              <Input
                placeholder="Add people by email"
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="flex-1"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="submit" size="icon" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add email</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>

            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="flex items-center gap-1 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                  >
                    <Mail className="h-3 w-3" />
                    <span className="text-sm">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 hover:text-teal-900 dark:hover:text-teal-100"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Can view</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      <span>Can edit</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <Globe className="h-5 w-5 text-teal-500" />
              <div className="flex-1 text-sm">
                <div className="font-medium">Share via link</div>
                <div className="text-gray-500 dark:text-gray-400">
                  Anyone with the link can {permission}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {isCopied ? "Copied" : "Copy link"}
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Link settings</div>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Anyone with the link can view</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      <span>Anyone with the link can edit</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        {members.length > 0 && (
          <div className="space-y-3 mt-4 border-t pt-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-500" />
              People with access
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {members.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Lock className="h-4 w-4 mr-1" />
            Only people with access can see this
          </div>
          <Button
            onClick={handleShare}
            disabled={activeTab === "email" && emails.length === 0}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {activeTab === "email" ? "Send invites" : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
